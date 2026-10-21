from typing import Any, ClassVar
from sqlalchemy.orm import as_declarative, declared_attr
from sqlalchemy import Column, DateTime, MetaData, TypeDecorator, CHAR
from sqlalchemy.sql import func
import uuid

class GUID(TypeDecorator):
    """Platform-independent GUID/UUID type.
    Handles both uuid.UUID and str bind parameters transparently across Postgres and SQLite.
    """
    impl = CHAR(36)
    cache_ok = True

    def __init__(self, as_uuid: bool = True, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.as_uuid = as_uuid

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID as PG_UUID
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            if isinstance(value, uuid.UUID):
                return value
            try:
                return uuid.UUID(str(value))
            except (ValueError, TypeError):
                return value
        else:
            if isinstance(value, uuid.UUID):
                return value.hex
            try:
                return uuid.UUID(str(value)).hex
            except (ValueError, TypeError):
                return str(value).replace("-", "")

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        try:
            return uuid.UUID(str(value))
        except (ValueError, TypeError):
            try:
                return uuid.UUID(hex=str(value))
            except (ValueError, TypeError):
                return value

@as_declarative()
class Base:
    metadata: ClassVar[MetaData]
    id: Any
    __name__: ClassVar[str]
    
    def __init__(self, **kwargs: Any) -> None:
        for key, value in kwargs.items():
            setattr(self, key, value)
            
    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
        
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
