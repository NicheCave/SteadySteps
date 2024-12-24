import { ZodiosHooks } from "@zodios/react";
import { api } from "@/client.ts";
export const apiHooks = new ZodiosHooks("SteadySteps", api);