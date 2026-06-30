export const PEOPLE_PHOTO_PREFIX = "/people/";
const LEGACY_PEOPLE_PHOTO_PREFIX = "/teachers/";

export function isLocalPeoplePhotoPath(webPath: string): boolean {
  return (
    webPath.startsWith(PEOPLE_PHOTO_PREFIX) ||
    webPath.startsWith(LEGACY_PEOPLE_PHOTO_PREFIX)
  );
}
