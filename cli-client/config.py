# API Configuration
API_BASE_URL = "http://localhost:3000"

# API Endpoints
ENDPOINTS = {
    "healthcheck": "/api/admin/healthcheck",  # Add /api prefix
    "resetpasses": "/api/admin/resetpasses",
    "resetstations": "/api/admin/resetstations",  # Add /api prefix
    "login": "/api/login",
    "tollstationpasses": "/api/tollStationPasses/{station}/{date_from}/{date_to}",  # Add new endpoint
    "passanalysis": "/api/passAnalysis/{stationop}/{tagop}/{date_from}/{date_to}",  # Add new endpoint
    "passescost": "/api/passesCost/{stationop}/{tagop}/{date_from}/{date_to}",  # Add new endpoint
    "chargesby": "/api/chargesBy/{opid}/{date_from}/{date_to}",  # Add new endpoint
    # Add other endpoints here...
} 