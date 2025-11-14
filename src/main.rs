mod gemini;
mod models;

use axum::{
    extract::State,
    http::{Method, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing::{error, info};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use gemini::GeminiClient;
use models::{ChatRequest, ChatResponse, ErrorResponse};

/// Application state shared across handlers
#[derive(Clone)]
struct AppState {
    gemini_client: Arc<GeminiClient>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables from .env file if present (for local development)
    dotenvy::dotenv().ok();

    // Get configuration from environment
    info!("Loading configuration from environment variables...");
    let api_key = std::env::var("GEMINI_API_KEY")
        .expect("GEMINI_API_KEY must be set in environment or .env file");
    info!("API key loaded successfully (length: {} chars)", api_key.len());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    info!("Using port: {}", port);

    // Initialize Gemini client
    let gemini_client = GeminiClient::new(api_key)?;
    let state = AppState {
        gemini_client: Arc::new(gemini_client),
    };

    // Configure CORS to allow requests from any origin
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    // Build the application router
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/chat", post(chat_handler))
        .route("/widget.js", get(serve_widget_js))
        .nest_service("/static", ServeDir::new("static"))
        .layer(cors)
        .with_state(state);

    // Start the server
    let addr = format!("0.0.0.0:{}", port);
    info!("Starting server on {}", addr);
    info!("Health check available at: http://localhost:{}/health", port);
    info!("Chat API available at: http://localhost:{}/api/chat", port);
    info!("Widget script available at: http://localhost:{}/widget.js", port);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "healthy",
        "service": "cybersecurity-chatbot"
    }))
}

/// Chat endpoint handler
async fn chat_handler(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> impl IntoResponse {
    if payload.message.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::new("Message cannot be empty")),
        )
            .into_response();
    }

    match state.gemini_client.chat(&payload.message).await {
        Ok(response) => (StatusCode::OK, Json(ChatResponse { response })).into_response(),
        Err(e) => {
            error!("Error processing chat request: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to generate response")),
            )
                .into_response()
        }
    }
}

/// Serve the widget JavaScript file
async fn serve_widget_js() -> impl IntoResponse {
    let js_content = include_str!("../static/widget.js");
    (
        StatusCode::OK,
        [("Content-Type", "application/javascript")],
        js_content,
    )
}

