import json
from enum import (
    Enum,
    auto,
)


class UserRole(Enum):
    guest = auto()
    normal = auto()


class AyuEncoder(json.JSONEncoder):
    prefix = "__enum__"

    def default(self, o):
        if isinstance(o, UserRole):
            return {self.prefix: o.name}
        else:
            return super().default(o)


def ayu_decode(d):
    if AyuEncoder.prefix in d:
        name = d[AyuEncoder.prefix]
        return UserRole[name]
    else:
        return d
