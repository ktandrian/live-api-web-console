export function assertEnv(name: string) {
  const v = process.env[name];
  if (v === undefined) throw new Error("Missing environment variable: " + name);
  return v;
}
