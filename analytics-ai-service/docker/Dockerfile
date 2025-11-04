# reference: https://medium.com/@albertazzir/blazing-fast-python-docker-builds-with-poetry-a78a66f5aed0

# --- Build Rust extension (analytics_rust_core) ---
# Use latest stable Rust (1.75 is too old for latest maturin)
FROM rust:latest as rust-builder

# Install Python for maturin (needs Python to detect version)
RUN apt-get update && \
    apt-get install -y python3 python3-dev python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Install maturin via pip with --break-system-packages (safe in Docker)
# This is needed because Debian uses externally-managed Python environments
RUN pip install --break-system-packages maturin

WORKDIR /app

# Copy Rust project files (including pyproject.toml for maturin)
# Build context is analytics-ai-service/, so rust/ is at root of context
COPY rust/Cargo.toml ./rust/
COPY rust/pyproject.toml ./rust/
COPY rust/src ./rust/src

WORKDIR /app/rust

# Build Python extension module using maturin
# This creates a properly packaged wheel with correct naming
RUN maturin build --release --out dist

# --- Build Python environment ---
FROM python:3.12.0-bookworm as builder

RUN pip install poetry==1.8.3

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

COPY pyproject.toml ./

RUN poetry install --without dev,eval,test --no-root && rm -rf $POETRY_CACHE_DIR

# Copy and install Rust extension module from wheel
# Note: maturin output is in /app/rust/dist/ (from WORKDIR /app/rust)
# Copy the dist folder and install from there (wildcard in COPY doesn't work well)
COPY --from=rust-builder /app/rust/dist /tmp/rust-wheels
# Install into the poetry venv (use poetry run pip to ensure correct environment)
# VIRTUAL_ENV is set by Poetry, use it explicitly
RUN . /app/.venv/bin/activate && \
    pip install /tmp/rust-wheels/*.whl && \
    rm -rf /tmp/rust-wheels && \
    # Verify installation
    python -c "import analytics_rust_core; print('✓ Rust module installed successfully')" || \
    (echo "ERROR: Failed to import analytics_rust_core" && ls -la /app/.venv/lib/python*/site-packages/ | grep analytics && exit 1)

FROM python:3.12.0-slim-bookworm as runtime

RUN apt-get update && apt install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

ENV VIRTUAL_ENV=/app/.venv \
    PATH="/app/.venv/bin:$PATH" \
    QDRANT_HOST=qdrant \
    WREN_AI_SERVICE_PORT=5555

WORKDIR /app

COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}

# Rust extension module is installed in venv from builder stage

COPY src /app/src
COPY entrypoint.sh /app/entrypoint.sh
COPY pyproject.toml /app/pyproject.toml

# Fix line endings CRLF -> LF and make executable
RUN chmod +x /app/entrypoint.sh && \
    sed -i 's/\r$//' /app/entrypoint.sh

ENTRYPOINT [ "/bin/bash", "/app/entrypoint.sh" ]