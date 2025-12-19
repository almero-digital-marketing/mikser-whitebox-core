declare module 'mikser-whitebox-sdk' {
    export interface ComponentCustomProperties {
        $href: (href: string, lang?: string, loaded?: boolean) => object,
        $document: object,
        $alternates: (href: string) => object[],
        $storage: (file: string) => string,
        $data: object,
    }
}