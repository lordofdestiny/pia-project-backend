type ValidObjectKey = string | number | symbol;

type InclusivePick<T extends {}, K extends ValidObjectKey> = {
    [key in K]: key extends keyof T ? T[key] : undefined;
};

declare global {
    interface ObjectConstructor {
        pick<T extends {}, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K>;
        pickInclusive<T extends {}, K extends ValidObjectKey>(
            obj: T,
            ...keys: K[]
        ): InclusivePick<T, K>;
        omit<T extends {}, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K>;
    }
}

Object.pick = <T extends {}, K extends keyof T>(obj, ...keys: K[]) =>
    Object.fromEntries(keys.filter((key) => key in obj).map((key) => [key, obj[key]])) as Pick<
        T,
        K
    >;

Object.pickInclusive = <T extends {}, K extends ValidObjectKey>(obj: T, ...keys: K[]) =>
    Object.fromEntries(keys.map((key) => [key, obj[key as unknown as keyof T]])) as InclusivePick<
        T,
        K
    >;

Object.omit = <T extends {}, K extends keyof T>(obj: T, ...keys: K[]) =>
    Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<
        T,
        K
    >;

export {};
