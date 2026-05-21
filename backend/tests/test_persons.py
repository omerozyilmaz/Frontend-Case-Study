VALID_TCKN = "11111111110"
VALID_TCKN_2 = "22222222220"


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_create_person_admin(client, admin_token):
    groups = client.get("/api/v1/profession-groups", headers=_auth_headers(admin_token))
    group_id = groups.json()[0]["id"]

    res = client.post(
        "/api/v1/persons",
        headers=_auth_headers(admin_token),
        json={
            "first_name": "Ahmet",
            "last_name": "Yılmaz",
            "tckn": VALID_TCKN,
            "email": "ahmet@example.com",
            "profession_group_id": group_id,
        },
    )
    assert res.status_code == 201
    assert res.json()["first_name"] == "Ahmet"


def test_create_person_forbidden_for_user(client, user_token, admin_token):
    groups = client.get("/api/v1/profession-groups", headers=_auth_headers(admin_token))
    group_id = groups.json()[0]["id"]

    res = client.post(
        "/api/v1/persons",
        headers=_auth_headers(user_token),
        json={
            "first_name": "Mehmet",
            "last_name": "Kaya",
            "tckn": VALID_TCKN_2,
            "email": "mehmet@example.com",
            "profession_group_id": group_id,
        },
    )
    assert res.status_code == 403


def test_list_persons_with_filters(client, admin_token, db_session):
    from app.models.person import Person
    from app.models.profession_group import ProfessionGroup

    pg = db_session.query(ProfessionGroup).first()
    db_session.add_all(
        [
            Person(
                first_name="Ahmet",
                last_name="Demir",
                tckn=VALID_TCKN,
                email="a1@example.com",
                profession_group_id=pg.id,
            ),
            Person(
                first_name="Zeynep",
                last_name="Kaya",
                tckn=VALID_TCKN_2,
                email="z1@example.com",
                profession_group_id=pg.id,
            ),
        ]
    )
    db_session.commit()

    res = client.get(
        "/api/v1/persons",
        headers=_auth_headers(admin_token),
        params={"name_contains": "Ahmet", "page": 1, "size": 10},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert any("Ahmet" in item["first_name"] for item in data["items"])
    assert "tckn_masked" in data["items"][0]


def test_duplicate_tckn_conflict(client, admin_token):
    groups = client.get("/api/v1/profession-groups", headers=_auth_headers(admin_token))
    group_id = groups.json()[0]["id"]
    payload = {
        "first_name": "Ali",
        "last_name": "Veli",
        "tckn": VALID_TCKN,
        "email": "ali1@example.com",
        "profession_group_id": group_id,
    }
    client.post("/api/v1/persons", headers=_auth_headers(admin_token), json=payload)
    payload["email"] = "ali2@example.com"
    res = client.post("/api/v1/persons", headers=_auth_headers(admin_token), json=payload)
    assert res.status_code == 409


def test_invalid_tckn_validation(client, admin_token):
    groups = client.get("/api/v1/profession-groups", headers=_auth_headers(admin_token))
    group_id = groups.json()[0]["id"]
    res = client.post(
        "/api/v1/persons",
        headers=_auth_headers(admin_token),
        json={
            "first_name": "Test",
            "last_name": "User",
            "tckn": "12345678901",
            "email": "bad@example.com",
            "profession_group_id": group_id,
        },
    )
    assert res.status_code == 422
