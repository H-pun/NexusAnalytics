import logging
from abc import ABCMeta, abstractmethod
from typing import Any, Dict, Optional, Tuple

import aiohttp
from pydantic import BaseModel

logger = logging.getLogger("analytics-service")


class EngineConfig(BaseModel):
    provider: str = "analytics_ui"
    config: dict = {}


class Engine(metaclass=ABCMeta):
    @abstractmethod
    async def execute_sql(
        self,
        sql: str,
        session: aiohttp.ClientSession,
        dry_run: bool = True,
        **kwargs,
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        ...


try:
    # Hard requirement: Rust extension must be present
    from analytics_rust_core import (
        clean_generation_result as _rs_clean_generation_result,
        remove_limit_statement as _rs_remove_limit_statement,
        add_quotes as _rs_add_quotes,
    )
except Exception as e:  # pragma: no cover
    # Fail fast with clear message
    raise RuntimeError(
        "analytics_rust_core module is required but not found. "
        "Install Rust toolchain and build the extension (maturin build --release), "
        "then install the generated wheel before starting the service."
    ) from e


def clean_generation_result(result: str) -> str:
    return _rs_clean_generation_result(result)


def remove_limit_statement(sql: str) -> str:
    return _rs_remove_limit_statement(sql)


def add_quotes(sql: str) -> Tuple[str, str]:
    return _rs_add_quotes(sql)
