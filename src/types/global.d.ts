declare module 'mikser-whitebox-core' {
    export interface ComponentCustomProperties {
        $href: (href: string, lang?: string, loaded?: boolean) => object,
        $document: object,
        $alternates: (href: string) => object[],
        $storage: (file: string) => string
    }
}