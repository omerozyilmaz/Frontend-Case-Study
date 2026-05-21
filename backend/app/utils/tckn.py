def validate_tckn(tckn: str) -> str:
    if not tckn.isdigit() or len(tckn) != 11:
        raise ValueError("TCKN 11 haneli sayı olmalıdır")
    if tckn[0] == "0":
        raise ValueError("TCKN ilk hanesi 0 olamaz")

    digits = [int(d) for d in tckn]
    odd_sum = sum(digits[0:9:2])
    even_sum = sum(digits[1:8:2])
    tenth = ((odd_sum * 7) - even_sum) % 10
    if tenth != digits[9]:
        raise ValueError("Geçersiz TCKN")

    eleventh = sum(digits[:10]) % 10
    if eleventh != digits[10]:
        raise ValueError("Geçersiz TCKN")

    return tckn


def mask_tckn(tckn: str, visible: int = 5) -> str:
    if len(tckn) <= visible:
        return tckn
    return tckn[:visible] + "*" * (len(tckn) - visible)
