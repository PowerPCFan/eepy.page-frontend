export interface TLD {
    tld: string;
    purchaseLink?: string;
    hidden: boolean;
}
export const AVAILABLE_TLDS: TLD[] = [
    {
        tld: ".eepy.page",
        hidden: false
    },
    {
        tld: ".worksonmymachine.top",
        hidden: false
    },
];
