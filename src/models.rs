use serde::{Deserialize, Serialize};

/// Request structure for the chat endpoint
#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    /// The user's message/question
    pub message: String,
}

/// Response structure for the chat endpoint
#[derive(Debug, Serialize)]
pub struct ChatResponse {
    /// The AI's response
    pub response: String,
}

/// Error response structure
#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    /// Error message
    pub error: String,
}

// The new() function is a helper to easily create error messages:

impl ErrorResponse {
    pub fn new(error: impl Into<String>) -> Self {
        Self {
            error: error.into(),
        }
    }
}

