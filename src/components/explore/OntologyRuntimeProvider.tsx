"use client";

import { useLayoutEffect } from "react";
import { setOntologySnapshot } from "@/lib/schools";
import { deserializeOntologySnapshot, type SerializedOntologySnapshot } from "@/lib/ontology/build-snapshot";

export function OntologyRuntimeProvider({
  ontology,
  children,
}: {
  ontology: SerializedOntologySnapshot;
  children: React.ReactNode;
}) {
  // Keep the client snapshot in sync during render so filters never flash stale labels.
  setOntologySnapshot(deserializeOntologySnapshot(ontology));

  useLayoutEffect(() => {
    setOntologySnapshot(deserializeOntologySnapshot(ontology));
  }, [ontology]);

  return children;
}
