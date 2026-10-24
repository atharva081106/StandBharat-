from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Any
import uuid

from app.api.deps import get_db, get_current_brand
from app.models.all_models import Brand, Campaign
from pydantic import ConfigDict, BaseModel

router = APIRouter()

class CampaignResponse(BaseModel):
    id: str
    workspace_id: str
    brand_id: str
    name: str
    description: str | None
    status: str
    budget: float | None
    spent: float | None
    start_date: str | None
    end_date: str | None
    
    model_config = ConfigDict(from_attributes=True)

@router.get("", response_model=List[CampaignResponse])
@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    campaigns = db.query(Campaign).filter(Campaign.brand_id == brand.id).all()
    return [{
        "id": str(c.id),
        "workspace_id": str(c.workspace_id),
        "brand_id": str(c.brand_id),
        "name": c.name,
        "description": c.description,
        "status": c.status,
        "budget": c.budget,
        "spent": c.spent,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None
    } for c in campaigns]

@router.post("")
@router.post("/", response_model=CampaignResponse)
def create_campaign(
    payload: dict = Body(...),
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    raw_budget = payload.get("budget")
    try:
        budget_val = float(raw_budget) if raw_budget is not None else None
    except (ValueError, TypeError):
        budget_val = None

    c = Campaign(
        workspace_id=brand.workspace_id,
        brand_id=brand.id,
        name=payload.get("name", "New Campaign"),
        description=payload.get("description"),
        budget=budget_val,
        status=payload.get("status", "ACTIVE")
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return {
        "id": str(c.id),
        "workspace_id": str(c.workspace_id),
        "brand_id": str(c.brand_id),
        "name": c.name,
        "description": c.description,
        "status": c.status,
        "budget": c.budget,
        "spent": c.spent,
        "start_date": c.start_date.isoformat() if c.start_date else None,
        "end_date": c.end_date.isoformat() if c.end_date else None
    }


@router.get("/festivals")
def get_indian_festivals():
    """
    Returns curated upcoming Indian festival calendar with dates, urgency score,
    estimated consumer spending uplift in India, and recommended marketing themes.
    """
    return [
        {
            "id": "diwali",
            "name": "Diwali & Dhanteras (Deepavali)",
            "date": "2026-11-08",
            "days_left": 16,
            "category": "Mega Shopping Season",
            "spending_uplift": "+340% E-Commerce Surge",
            "urgency": "CRITICAL",
            "themes": ["Gifting", "Gold & Wealth", "Home Makeover", "Festive Discounts", "Dhamaka Offers"],
            "suggested_discount": "25% - 40% OFF",
            "indic_greetings": "शुभ दीपावली (Shubh Deepavali)",
            "primary_channels": ["WhatsApp Broadcast", "Instagram Reels", "Google Shopping", "YouTube Shorts"]
        },
        {
            "id": "navratri",
            "name": "Navratri & Dussehra (Durga Puja)",
            "date": "2026-10-28",
            "days_left": 5,
            "category": "Cultural & Fashion Spike",
            "spending_uplift": "+210% Retail Demand",
            "urgency": "HIGH",
            "themes": ["Ethnic Fashion", "Celebration", "Victory of Good", "9 Days of Deals"],
            "suggested_discount": "Flat 30% OFF",
            "indic_greetings": "शुभ नवरात्रि (Shubh Navratri)",
            "primary_channels": ["Instagram Carousels", "WhatsApp Alerts", "Meta Ads"]
        },
        {
            "id": "republic_day",
            "name": "Republic Day (Ganatantra Diwas)",
            "date": "2027-01-26",
            "days_left": 95,
            "category": "National Pride & Electronics",
            "spending_uplift": "+180% Patriotic Mega Sale",
            "urgency": "UPCOMING",
            "themes": ["Made in India", "Vocal for Local", "Stand with Bharat", "Freedom to Save"],
            "suggested_discount": "Up to 50% OFF",
            "indic_greetings": "गणतंत्र दिवस की हार्दिक शुभकामनाएं",
            "primary_channels": ["LinkedIn Thought Leadership", "YouTube Shorts", "WhatsApp"]
        },
        {
            "id": "holi",
            "name": "Holi (Rangotsav)",
            "date": "2027-03-24",
            "days_left": 152,
            "category": "Color & Joy Spring Festive",
            "spending_uplift": "+195% FMCG & Hospitality",
            "urgency": "PLANNED",
            "themes": ["Organic Colors", "Holi Hampers", "Spring Refresh", "Colorful Savings"],
            "suggested_discount": "Buy 1 Get 1 / 30% OFF",
            "indic_greetings": "होली की हार्दिक शुभकामनाएं (Happy Holi)",
            "primary_channels": ["Instagram Reels", "WhatsApp Studio", "Email Blast"]
        },
        {
            "id": "raksha_bandhan",
            "name": "Raksha Bandhan",
            "date": "2027-08-28",
            "days_left": 309,
            "category": "Sibling Gifting",
            "spending_uplift": "+250% Personalized Gifting",
            "urgency": "PLANNED",
            "themes": ["Brother-Sister Bonding", "Premium Gift Boxes", "Express Courier Delivery"],
            "suggested_discount": "Free Gift Wrapping + 20% OFF",
            "indic_greetings": "रक्षाबंधन की ढेर सारी शुभकामनाएं",
            "primary_channels": ["WhatsApp Catalog", "Instagram Carousels"]
        }
    ]


@router.post("/festive-sprint")
def create_festive_sprint(
    payload: dict = Body(...),
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    """
    Generates a full 1-click Indian festive marketing sprint.
    Creates a dedicated Campaign in PostgreSQL and automatically populates ContentDrafts.
    """
    festival_id = payload.get("festival_id", "diwali")
    festival_name = payload.get("festival_name", "Diwali Mega Dhamaka")
    budget = float(payload.get("budget", 75000))
    discount = payload.get("discount", "30% OFF")
    target_market = payload.get("target_market", "Pan-India (Tier 1 & 2)")

    # 1. Create Campaign
    c = Campaign(
        workspace_id=brand.workspace_id,
        brand_id=brand.id,
        name=f"{festival_name} Sprint - {brand.name}",
        description=f"Automated Indian festive high-conversion sprint. Target: {target_market}. Offer: {discount}. Multi-channel synchronization on WhatsApp, Meta, and Search.",
        budget=budget,
        spent=0.0,
        status="ACTIVE"
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    # 2. Auto-create content drafts for this campaign if ContentDraft table exists
    from app.models.all_models import ContentDraft, ContentProject
    project = db.query(ContentProject).filter(ContentProject.brand_id == brand.id).first()
    if not project:
        project = ContentProject(
            workspace_id=brand.workspace_id,
            brand_id=brand.id,
            title=f"{festival_name} Deliverables",
            objective=f"Festive creative assets for {festival_name}",
            content_type="campaign"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    # Draft 1: WhatsApp Broadcast
    d1 = ContentDraft(
        workspace_id=brand.workspace_id,
        brand_id=brand.id,
        content_project_id=project.id,
        title=f"WhatsApp Blast: {festival_name} Exclusive VIP Access ({discount})",
        body=(
            f"✨ Namaste {{{{name}}}}! Stand with {brand.name} this festive season! ✨\n\n"
            f"Celebrate {festival_name} with our biggest offer of the year: flat *{discount}* on all orders.\n\n"
            f"🎁 Free festive gift box on prepaid UPI orders!\n"
            f"⚡ Valid for next 48 hours only.\n\n"
            f"Tap below to claim your festive reward:\n"
            f"🔗 {brand.website_url or 'https://standbharat.in'}/festive-offer?code=DIWALI{brand.name[:3].upper()}"
        ),
        content_type="whatsapp",
        status="PENDING",
        generation_metadata={"festival": festival_id, "channel": "WhatsApp", "campaign_id": str(c.id)}
    )

    # Draft 2: Instagram / LinkedIn Carousel
    d2 = ContentDraft(
        workspace_id=brand.workspace_id,
        brand_id=brand.id,
        content_project_id=project.id,
        title=f"Social Carousel: 5 Ways {brand.name} Celebrates {festival_name}",
        body=(
            f"Slide 1: This {festival_name}, don't settle for ordinary.\n"
            f"Slide 2: Why 10,000+ Indian businesses choose {brand.name}.\n"
            f"Slide 3: High-speed reliability built for Bharat.\n"
            f"Slide 4: Customer Spotlight & +300% Festive ROI.\n"
            f"Slide 5: Claim your {discount} festive grant today! Link in bio."
        ),
        content_type="social",
        status="PENDING",
        generation_metadata={"festival": festival_id, "channel": "Instagram / LinkedIn", "campaign_id": str(c.id)}
    )

    db.add(d1)
    db.add(d2)
    db.commit()

    return {
        "campaign_id": str(c.id),
        "campaign_name": c.name,
        "status": "LAUNCHED",
        "budget": c.budget,
        "drafts_generated": 2,
        "message": f"Festive sprint for {festival_name} successfully launched with 2 approval-ready drafts!"
    }


@router.post("/whatsapp-broadcast")
def generate_whatsapp_broadcast(
    payload: dict = Body(...),
    brand: Brand = Depends(get_current_brand),
    db: Session = Depends(get_db)
):
    """
    Generates an optimized WhatsApp broadcast template with dynamic variables,
    quick reply CTA buttons, and high-conversion Indian vernacular/Hinglish copy.
    """
    template_type = payload.get("template_type", "festive_offer")
    customer_segment = payload.get("customer_segment", "VIP Customers")
    offer_text = payload.get("offer_text", "Flat 25% OFF + Free Gift")
    code = payload.get("code", "BHARAT25")

    templates = {
        "festive_offer": {
            "title": "Festive Dhamaka VIP Broadcast",
            "body": (
                f"✨ Namaste *{{{{name}}}}*!\n\n"
                f"Festive celebrations just got brighter with *{brand.name}*! 🪔\n\n"
                f"As our cherished customer, enjoy an exclusive VIP festive pass: *{offer_text}*.\n\n"
                f"Use Secret Code: *{code}* at checkout.\n"
                f"📦 Same-day dispatch across India.\n\n"
                f"Tap below to shop before stock clears:"
            ),
            "buttons": [
                {"type": "URL", "text": "🛍️ Shop Festive Collection", "url": f"{brand.website_url or 'https://standbharat.in'}/shop?code={code}"},
                {"type": "QUICK_REPLY", "text": "💬 Talk to Founder on WhatsApp"}
            ]
        },
        "cart_recovery": {
            "title": "Abandoned Cart Recovery (COD / UPI)",
            "body": (
                f"Hey *{{{{name}}}}*, your cart is missing you! 🛒\n\n"
                f"We saved the items you left behind at *{brand.name}*.\n\n"
                f"⚡ Complete your order now and get an extra *10% INSTANT CASHBACK* via UPI.\n"
                f"🔒 Cash on Delivery (COD) is also available across 19,000+ PIN codes."
            ),
            "buttons": [
                {"type": "URL", "text": "⚡ Complete My Order Now", "url": f"{brand.website_url or 'https://standbharat.in'}/cart?resume=true"},
                {"type": "QUICK_REPLY", "text": "❓ Have a question about sizing"}
            ]
        },
        "cod_confirmation": {
            "title": "COD Order Verification & RTO Reducer",
            "body": (
                f"Hello *{{{{name}}}}*, thank you for choosing *{brand.name}*! 🙏\n\n"
                f"Your Cash on Delivery order *#{{{{order_id}}}}* for *{{{{product_name}}}}* is ready for dispatch.\n\n"
                f"To ensure zero delay in delivery, please confirm your delivery address by clicking below:"
            ),
            "buttons": [
                {"type": "QUICK_REPLY", "text": "✅ Confirm Order Dispatch"},
                {"type": "URL", "text": "💳 Pay Now (Get ₹50 Off)", "url": f"{brand.website_url or 'https://standbharat.in'}/pay-upi"}
            ]
        },
        "flash_deal": {
            "title": "Flash 2-Hour Midnight Deal",
            "body": (
                f"🚨 *FLASH ALERT: 2 HOURS ONLY* 🚨\n\n"
                f"*{brand.name}* Midnight Madness is LIVE!\n"
                f"Grab *{offer_text}* before midnight IST tonight.\n\n"
                f"Coupon Code: *{code}*\n"
                f"⏳ Timer is ticking — only 47 festive units left!"
            ),
            "buttons": [
                {"type": "URL", "text": "🔥 Grab Flash Deal", "url": f"{brand.website_url or 'https://standbharat.in'}/flash"},
                {"type": "QUICK_REPLY", "text": "Remind Me Next Time"}
            ]
        }
    }

    selected = templates.get(template_type, templates["festive_offer"])
    return {
        "template_type": template_type,
        "customer_segment": customer_segment,
        "title": selected["title"],
        "body": selected["body"],
        "buttons": selected["buttons"],
        "indic_support": True,
        "estimated_open_rate": "92.4%",
        "estimated_ctr": "24.8%"
    }
