import "@sapphire/framework";

declare module "@sapphire/framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
