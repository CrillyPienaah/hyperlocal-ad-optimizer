from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import uvicorn

app = FastAPI(title="Hyperlocal Ad Optimizer API", version="1.0.0")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Style rules configuration
STYLE_RULES = {
    "modern-clean": {
        "colors": [
            {"name": "Primary", "palette": ["#2563EB", "#1E40AF", "#1D4ED8"]},
            {"name": "Accent", "palette": ["#F3F4F6", "#E5E7EB", "#D1D5DB"]},
            {"name": "Highlight", "palette": ["#10B981", "#059669", "#047857"]}
        ],
        "imagery": [
            "Clean product photography with white backgrounds",
            "Minimal geometric patterns and shapes",
            "Professional business photography",
            "Simple icons and illustrations"
        ],
        "fonts": {
            "headline": "Inter",
            "body": "system-ui"
        },
        "mock_tile_text": "Modern Business"
    },
    "friendly-local": {
        "colors": [
            {"name": "Warm", "palette": ["#F59E0B", "#D97706", "#B45309"]},
            {"name": "Natural", "palette": ["#84CC16", "#65A30D", "#4D7C0F"]},
            {"name": "Comfort", "palette": ["#EF4444", "#DC2626", "#B91C1C"]}
        ],
        "imagery": [
            "Local community photos and events",
            "Warm, natural lighting in photography",
            "Hand-drawn illustrations and doodles",
            "Authentic customer testimonial photos"
        ],
        "fonts": {
            "headline": "Poppins",
            "body": "sans-serif"
        },
        "mock_tile_text": "Local Community"
    },
    "classic-professional": {
        "colors": [
            {"name": "Traditional", "palette": ["#1F2937", "#374151", "#4B5563"]},
            {"name": "Elegant", "palette": ["#7C2D12", "#92400E", "#A16207"]},
            {"name": "Refined", "palette": ["#1E3A8A", "#1E40AF", "#2563EB"]}
        ],
        "imagery": [
            "Professional headshots and office photography",
            "Classic architectural elements",
            "Elegant product arrangements",
            "Traditional business imagery"
        ],
        "fonts": {
            "headline": "Playfair Display",
            "body": "Georgia"
        },
        "mock_tile_text": "Professional Service"
    },
    "bold-eye-catching": {
        "colors": [
            {"name": "Vibrant", "palette": ["#EC4899", "#DB2777", "#BE185D"]},
            {"name": "Electric", "palette": ["#8B5CF6", "#7C3AED", "#6D28D9"]},
            {"name": "Dynamic", "palette": ["#F97316", "#EA580C", "#C2410C"]}
        ],
        "imagery": [
            "High-contrast photography with dramatic lighting",
            "Bold graphic elements and patterns",
            "Dynamic action shots and movement",
            "Bright, saturated color photography"
        ],
        "fonts": {
            "headline": "Montserrat",
            "body": "Arial Black"
        },
        "mock_tile_text": "Bold Impact"
    }
}

@app.get("/api/style-recommendations")
async def get_style_recommendations(business_type: str = "retail", vibe: str = "modern-clean") -> Dict[str, Any]:
    """
    Returns visual design recommendations based on the vibe and business type.
    
    Args:
        business_type: Type of business (e.g., retail, restaurant, services)
        vibe: Design vibe (modern-clean, friendly-local, classic-professional, bold-eye-catching)
    
    Returns:
        Dictionary containing color palettes, imagery suggestions, fonts, and mock tile text
    """
    
    # Normalize vibe parameter to match our keys
    vibe_key = vibe.lower().replace(" ", "-").replace("&", "").replace("--", "-").strip("-")
    
    # Get base recommendations or default to modern-clean
    recommendations = STYLE_RULES.get(vibe_key, STYLE_RULES["modern-clean"]).copy()
    
    # Dynamic customization for local vibes and specific business types
    if "local" in vibe.lower() and business_type:
        # Update first imagery suggestion with business-specific content
        business_type_clean = business_type.lower()
        recommendations["imagery"] = recommendations["imagery"].copy()
        recommendations["imagery"][0] = f"Photos of happy customers at your {business_type_clean}"
        
        # Add business-specific imagery suggestions
        business_imagery_map = {
            "restaurant": [
                "Food photography showcasing local ingredients",
                "Cozy interior shots with local community feel",
                "Staff and chef personality photos"
            ],
            "retail": [
                "Product displays with local context",
                "Customer browsing and shopping moments",
                "Store front and neighborhood integration"
            ],
            "services": [
                "Before/after service results in local settings",
                "Professional team in community context",
                "Client testimonials with local landmarks"
            ],
            "healthcare": [
                "Welcoming facility exterior and interior",
                "Professional staff in community setting",
                "Patient care moments with local feel"
            ],
            "fitness": [
                "Local community workout sessions",
                "Outdoor fitness in neighborhood parks",
                "Member success stories with local backdrop"
            ]
        }
        
        if business_type_clean in business_imagery_map:
            recommendations["imagery"].extend(business_imagery_map[business_type_clean])
    
    # Enhance recommendations with business type context
    business_context = {
        "restaurant": {
            "color_description": "Colors that stimulate appetite and create warmth",
            "font_style": "Readable menu fonts with personality"
        },
        "retail": {
            "color_description": "Colors that encourage browsing and purchases",
            "font_style": "Clear product labels and attractive displays"
        },
        "services": {
            "color_description": "Professional colors that build trust",
            "font_style": "Authoritative yet approachable typography"
        },
        "healthcare": {
            "color_description": "Calming colors that reduce anxiety",
            "font_style": "Clear, accessible fonts for all ages"
        },
        "fitness": {
            "color_description": "Energizing colors that motivate action",
            "font_style": "Bold, dynamic fonts that inspire"
        }
    }
    
    # Add business context to response
    if business_type.lower() in business_context:
        recommendations["business_context"] = business_context[business_type.lower()]
    
    # Add metadata
    recommendations["metadata"] = {
        "business_type": business_type,
        "vibe": vibe,
        "generated_for": "hyperlocal_advertising"
    }
    
    return recommendations

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Hyperlocal Ad Optimizer API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "style-recommendations",
        "available_vibes": list(STYLE_RULES.keys()),
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)