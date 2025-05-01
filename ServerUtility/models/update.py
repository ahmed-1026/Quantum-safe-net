from typing import Dict


class UpdateUrl:
    binaryUrl: str
    versionUrl: str

    def __init__(self, binaryUrl: str, versionUrl: str) -> None:
        self.binaryUrl = binaryUrl
        self.versionUrl = versionUrl

    @staticmethod
    def from_json(data: Dict) -> 'UpdateUrl':
        return UpdateUrl(binaryUrl=data.get('binaryUrl', ''), versionUrl=data.get('versionUrl', ''))
