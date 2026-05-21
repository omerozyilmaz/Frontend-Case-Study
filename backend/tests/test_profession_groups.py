def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_profession_group_admin(client, admin_token):
    res = client.post(
        "/api/v1/profession-groups",
        headers=_auth_headers(admin_token),
        json={"name": "Doktor"},
    )
    assert res.status_code == 201
    assert res.json()["name"] == "Doktor"


def test_create_profession_group_forbidden_user(client, user_token):
    res = client.post(
        "/api/v1/profession-groups",
        headers=_auth_headers(user_token),
        json={"name": "Avukat"},
    )
    assert res.status_code == 403
