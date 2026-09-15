from fastapi import APIRouter
from app.api.routes import (
    health, auth, students, dashboard, attendance,
    registration, noc, fees, marks, library, messaging,
    placement, forum, timetable, academic_materials,
    faculty_portal, admin_portal
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(registration.router, prefix="/registration", tags=["Registration"])
api_router.include_router(noc.router, prefix="/noc", tags=["NOC Application"])
api_router.include_router(fees.router, prefix="/fees", tags=["Fees"])
api_router.include_router(marks.router, prefix="/marks", tags=["Sessional Marks"])
api_router.include_router(library.router, prefix="/library", tags=["Library"])
api_router.include_router(messaging.router, prefix="/messages", tags=["Messaging & Grievances"])
api_router.include_router(placement.router, prefix="/placements", tags=["Placements"])
api_router.include_router(forum.router, prefix="/forum", tags=["Discussion Forum"])
api_router.include_router(timetable.router, prefix="/timetable", tags=["Timetable"])
api_router.include_router(academic_materials.router, prefix="/academic-materials", tags=["Academic Materials"])
api_router.include_router(faculty_portal.router, prefix="/faculty-portal", tags=["Faculty Portal"])
api_router.include_router(admin_portal.router, prefix="/admin-portal", tags=["Admin Portal"])
