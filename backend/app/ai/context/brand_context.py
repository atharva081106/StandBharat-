import json
import logging
import time
from typing import Optional, Dict
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.all_models import (
    Brand, BrandVoice, Audience, Product, Positioning, Goal, 
    Competitor, BrandStrategy, BrandDocument, WebsiteAnalysis
)
from app.schemas.brand_brain import BrandContextResponse

logger = logging.getLogger(__name__)

# In-memory fallback cache with TTL
_MEMORY_CACHE: Dict[str, tuple[str, float]] = {}
MEMORY_CACHE_TTL_SECONDS = 300.0

def _get_redis_client():
    try:
        import redis
        client = redis.Redis.from_url(settings.REDIS_URL, protocol=2, socket_timeout=1.5)
        return client
    except Exception as e:
        logger.debug(f"Redis cache client unavailable: {e}")
        return None

class BrandContextService:
    def get_brand_context(self, db: Session, brand_id: UUID, workspace_id: UUID) -> BrandContextResponse:
        cache_key = f"cache:brand_context:{str(workspace_id)}:{str(brand_id)}"
        
        # 1. Try Redis Cache
        r = _get_redis_client()
        if r:
            try:
                cached_bytes = r.get(cache_key)
                if cached_bytes:
                    return BrandContextResponse.model_validate_json(cached_bytes.decode("utf-8"))
            except Exception as e:
                logger.debug(f"Redis cache read miss/error: {e}")
                
        # 2. Try In-Memory Fallback Cache
        now = time.time()
        if cache_key in _MEMORY_CACHE:
            cached_json, expiry = _MEMORY_CACHE[cache_key]
            if now < expiry:
                try:
                    return BrandContextResponse.model_validate_json(cached_json)
                except Exception:
                    pass

        # 3. Cache Miss: Query Database
        brand = db.query(Brand).filter(Brand.id == brand_id, Brand.workspace_id == workspace_id).first()
        if not brand:
            raise HTTPException(status_code=403, detail="Brand not found in this workspace")
            
        voice = db.query(BrandVoice).filter(BrandVoice.brand_id == brand.id).first()
        audiences = db.query(Audience).filter(Audience.brand_id == brand.id).all()
        products = db.query(Product).filter(Product.brand_id == brand.id).all()
        positioning = db.query(Positioning).filter(Positioning.brand_id == brand.id).first()
        goals = db.query(Goal).filter(Goal.brand_id == brand.id).all()
        competitors = db.query(Competitor).filter(Competitor.brand_id == brand.id).all()
        strategy = db.query(BrandStrategy).filter(BrandStrategy.brand_id == brand.id).first()
        documents = db.query(BrandDocument).filter(BrandDocument.brand_id == brand.id).all()
        website_analysis = db.query(WebsiteAnalysis).filter(WebsiteAnalysis.brand_id == brand.id).first()
        
        context_response = BrandContextResponse(
            brand=brand,
            voice=voice,
            audiences=audiences,
            products=products,
            positioning=positioning,
            goals=goals,
            competitors=competitors,
            strategy=strategy,
            documents=documents,
            website_analysis=website_analysis
        )

        # 4. Populate Cache
        try:
            dumped_json = context_response.model_dump_json()
            # Store in Memory
            _MEMORY_CACHE[cache_key] = (dumped_json, now + MEMORY_CACHE_TTL_SECONDS)
            # Store in Redis with TTL
            if r:
                try:
                    r.setex(cache_key, int(MEMORY_CACHE_TTL_SECONDS), dumped_json)
                except Exception as cache_err:
                    logger.debug(f"Failed to populate Redis cache: {cache_err}")
        except Exception as ser_err:
            logger.debug(f"Could not serialize BrandContextResponse for caching: {ser_err}")

        return context_response

    def invalidate_brand_context(self, brand_id: UUID, workspace_id: Optional[UUID] = None):
        """Invalidate cached context when brand settings, voice, or audience update."""
        pattern_or_key = f"cache:brand_context:*:{str(brand_id)}" if not workspace_id else f"cache:brand_context:{str(workspace_id)}:{str(brand_id)}"
        
        # Invalidate in-memory
        keys_to_del = [k for k in _MEMORY_CACHE if str(brand_id) in k]
        for k in keys_to_del:
            _MEMORY_CACHE.pop(k, None)

        # Invalidate in Redis
        r = _get_redis_client()
        if r:
            try:
                if workspace_id:
                    r.delete(pattern_or_key)
                else:
                    for k in r.scan_iter(match=pattern_or_key):
                        r.delete(k)
            except Exception as e:
                logger.debug(f"Redis cache invalidation error: {e}")

brand_context_service = BrandContextService()
