const cache: any = {};

export function store(key: string, value: any) {
    cache[key] = value;
}

export function remove(key: string) {
    delete cache[key];
}

export function get(key: string): any {
    return cache[key];
}