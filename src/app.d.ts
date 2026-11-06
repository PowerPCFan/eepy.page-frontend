// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            locale: string;
            i18n: typeof import("@powerpcfan/eepy-page-i18n").rootI18n;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
