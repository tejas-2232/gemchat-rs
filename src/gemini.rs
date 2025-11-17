use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info};

/// Gemini AI client for handling chat requests
pub struct GeminiClient {
    api_key: String,
    client: reqwest::Client,
    model: String,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<Content>,
    #[serde(rename = "systemInstruction", skip_serializing_if = "Option::is_none")]
    system_instruction: Option<Content>,
}

#[derive(Serialize, Deserialize)]
struct Content {
    parts: Vec<Part>,
    #[serde(skip_serializing_if = "Option::is_none")]
    role: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Part {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Vec<Candidate>,
}

#[derive(Deserialize)]
struct Candidate {
    content: Content,
}

impl GeminiClient {
    /// Create a new Gemini client with the provided API key
    pub fn new(api_key: String) -> Result<Self> {
        let client = reqwest::Client::new();
        let model = "gemini-2.5-flash".to_string();
        info!("Gemini client initialized successfully with model: {}", model);
        info!("API key length: {} characters", api_key.len());
        Ok(Self {
            api_key,
            client,
            model,
        })
    }

    /// Generate a response to a user's question about cybersecurity
    pub async fn chat(&self, user_message: &str) -> Result<String> {
        debug!("Processing chat request: {}", user_message);

        // System instruction for cybersecurity education context
        let system_instruction = Content {
            parts: vec![Part {
                text: "You are a helpful cybersecurity tutor assistant for university students. \
                Your role is to explain cybersecurity concepts, terminologies, attack types and defenses \
                in a clear, educational manner suitable for classroom learning. \
                Keep explanations concise but informative. \
                Use examples when helpful. \
                If asked about something unrelated to cybersecurity or sensitive topics, politely redirect the conversation \
                back to cybersecurity topics. \
                Always prioritize educational value and ethical understanding.".to_string(),
            }],
            role: None,
        };

        // User's message
        let user_content = Content {
            parts: vec![Part {
                text: user_message.to_string(),
            }],
            role: Some("user".to_string()),
        };

        // Build the request with system instruction (supported in v1beta)
        let request = GeminiRequest {
            contents: vec![user_content],
            system_instruction: Some(system_instruction),
        };

        // API endpoint (v1beta for Gemini 2.5)
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model, self.api_key
        );

        // Call Gemini API
        match self.client.post(&url).json(&request).send().await {
            Ok(response) => {
                let status = response.status();
                if !status.is_success() {
                    let error_text = response.text().await.unwrap_or_default();
                    error!("Gemini API error ({}): {}", status, error_text);
                    return Err(anyhow::anyhow!("Gemini API error: {}", status));
                }

                let gemini_response: GeminiResponse = response
                    .json()
                    .await
                    .context("Failed to parse Gemini response")?;

                // Extract the text from the first candidate
                let text = gemini_response
                    .candidates
                    .first()
                    .and_then(|c| c.content.parts.first())
                    .map(|p| p.text.clone())
                    .context("No response text from Gemini")?;

                info!("Successfully generated response");
                debug!("Response: {}", text);

                Ok(text)
            }
            Err(e) => {
                error!("Gemini API request error: {}", e);
                Err(anyhow::anyhow!("Failed to call Gemini API: {}", e))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires API key
    async fn test_gemini_client() {
        let api_key = std::env::var("GEMINI_API_KEY").expect("GEMINI_API_KEY not set");
        let client = GeminiClient::new(api_key).unwrap();
        let response = client.chat("What is SQL injection?").await.unwrap();
        assert!(!response.is_empty());
    }
}