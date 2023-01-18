// @ts-expect-error template_name gets replaced
import * as rustAll from "template_name_rust";
// eslint-disable-next-line no-unused-vars
const { default: _, initSync: __, ...rustRest } = rustAll;
export default rustRest;