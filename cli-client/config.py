# API Configuration
API_BASE_URL = "http://localhost:9115"

# API Endpoints
ENDPOINTS = {
    "healthcheck": "/api/admin/healthcheck",
    "resetpasses": "/api/admin/resetpasses",
    "resetstations": "/api/admin/resetstations",
    "login": "/api/login",
    "tollstationpasses": "/api/tollStationPasses/{station}/{date_from}/{date_to}",
    "passanalysis": "/api/passAnalysis/{stationop}/{tagop}/{date_from}/{date_to}",
    "passescost": "/api/passesCost/{stationop}/{tagop}/{date_from}/{date_to}",
    "chargesby": "/api/chargesBy/{opid}/{date_from}/{date_to}",
    "admin": {
        "addpasses": "/api/admin/addpasses"
    }
} 