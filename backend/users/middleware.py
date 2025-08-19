from django.conf import settings

class JWTCookieToAuthHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get JWT token from cookies
        jwt_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE'])

        # If found, add to Authorization header
        if jwt_token:
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {jwt_token}'
            
        response = self.get_response(request)
        return response
