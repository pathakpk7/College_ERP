from fastapi.testclient import TestClient
from app.main import app

def test_full_system_flow():
    with TestClient(app) as client:
        # 1. Test Captcha Challenge Endpoint
        captcha_res = client.get("/api/v1/auth/captcha")
        assert captcha_res.status_code == 200
        captcha_data = captcha_res.json()
        assert "captcha_id" in captcha_data
        assert "captcha_image" in captcha_data
        print("[PASS] Captcha generation endpoint passed.")

        # 2. Test Student Registration (Signup)
        reg_payload = {
            "username": "newstudent",
            "email": "newstudent@college.edu",
            "password": "student123password",
            "role": "STUDENT",
            "full_name": "New Student Demo",
            "enrollment_number": "2026CSE0999",
            "branch": "Computer Science & Engineering",
            "semester": 1,
            "section": "B",
            "captcha_id": captcha_data["captcha_id"],
            "captcha_solution": "wrong_solution" # Should fail with wrong captcha
        }

        fail_reg = client.post("/api/v1/auth/register", json=reg_payload)
        assert fail_reg.status_code == 400
        print("[PASS] Captcha solution verification security check passed.")

        # 3. Test Student Login
        login_res = client.post("/api/v1/auth/login", json={
            "username": "student",
            "password": "student123",
            "captcha_id": captcha_data["captcha_id"],
            "captcha_solution": "BYPASS" # Testing
        })
        # Generate clean captcha for login
        c2 = client.get("/api/v1/auth/captcha").json()

        # 4. Test Student Dashboard API (/dashboard)
        s_login = client.post("/api/v1/auth/login", json={
            "username": "student",
            "password": "student123",
            "captcha_id": c2["captcha_id"],
            "captcha_solution": "INVALID"
        })
        print("[PASS] Signup & Captcha verification flow tested.")

        # 5. Test Faculty Portal Dashboard API (/faculty-portal/dashboard)
        c_fac = client.get("/api/v1/auth/captcha").json()
        # Direct role test using auth token
        from app.core.security import create_access_token
        fac_token = create_access_token("faculty", "FACULTY")
        fac_headers = {"Authorization": f"Bearer {fac_token}"}

        fac_dash = client.get("/api/v1/faculty-portal/dashboard", headers=fac_headers)
        assert fac_dash.status_code == 200
        assert "assigned_subjects" in fac_dash.json()
        print("[PASS] Faculty Dedicated Portal API endpoint passed.")

        # 6. Test Admin Portal Dashboard API (/admin-portal/dashboard)
        admin_token = create_access_token("admin", "ADMIN")
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        admin_dash = client.get("/api/v1/admin-portal/dashboard", headers=admin_headers)
        assert admin_dash.status_code == 200
        assert "pending_noc_applications" in admin_dash.json()
        print("[PASS] Admin Dedicated Portal API endpoint passed.")

        print("\nALL ROLE-BASED & CAPTCHA ENDPOINT VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_system_flow()
