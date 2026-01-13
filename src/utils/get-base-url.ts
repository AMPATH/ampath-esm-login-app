import { getConfig } from "@openmrs/esm-framework";
import { moduleName } from "../..";

export async function getEtlBaseUrl() {
  const { etlBaseUrl } = await getConfig(moduleName);
  return etlBaseUrl ?? null;
}
