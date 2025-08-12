let groupId: PeerId | null = null;

export function setGroupId(id: PeerId) {
  groupId = id;
}

export function getGroupId(): PeerId | null {
  return groupId;
}
