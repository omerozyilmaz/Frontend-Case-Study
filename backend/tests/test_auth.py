def test_login_success_sets_cookie(client):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "Admin123!"})
    assert res.status_code == 200
    assert res.json() == {"role": "admin"}
    assert client.cookies.get("crudfab_session")


def test_login_invalid_credentials(client):
    res = client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "wrong1"})
    assert res.status_code == 401


def test_protected_route_without_token(client):
    res = client.get("/api/v1/persons")
    assert res.status_code == 401


def test_me_returns_role_for_logged_in_user(client):
    client.post("/api/v1/auth/login", json={"email": "user@test.com", "password": "User123!"})
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert res.json() == {"role": "user"}


def test_logout_clears_cookie(client):
    client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "Admin123!"})
    res = client.post("/api/v1/auth/logout")
    assert res.status_code == 204
    me = client.get("/api/v1/auth/me")
    assert me.status_code == 401
