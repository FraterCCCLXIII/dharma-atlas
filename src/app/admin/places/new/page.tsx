import { PlaceForm } from "@/components/admin/PlaceForm";
import { randomBytes } from "node:crypto";

export default function NewPlacePage() {
  const id = randomBytes(6).toString("hex");

  return (
    <PlaceForm
      mode="create"
      initial={{
        id,
        name: "",
        lat: 0,
        lng: 0,
        tradition: "Buddhist",
        faith: "Buddhist",
        type: "Center",
        folder: "",
        address: "",
        phone: null,
        website: null,
        description: null,
        descriptionSource: null,
        coordPrecision: "unknown",
        dataSource: null,
        verifiedFields: [],
        qualityFlags: [],
        photo: null,
        photoSource: null,
        schools: [],
        isDraft: false,
      }}
    />
  );
}
