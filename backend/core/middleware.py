import threading

# Thread-local storage to hold the current request
_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Store user in thread storage before view runs
        _thread_locals.user = request.user if request.user.is_authenticated else None
        
        response = self.get_response(request)
        
        # Cleanup
        if hasattr(_thread_locals, 'user'):
            del _thread_locals.user
            
        return response