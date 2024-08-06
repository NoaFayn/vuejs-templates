
/**
 * A cache used to fast-access elements that were previously retrieved.
 */
export interface ICache<K, V> {
  get: (key: K) => Promise<V | null>
  reset: () => void
}

/**
 * Cache options
 */
interface CacheOptions {
  /**
   * Number of previous items to keep in cache
   */
  previousItems?: number
  /**
   * Number of following items to keep in cache
   */
  followingItems?: number
}

/**
 * Simple cache that stores all data passing through.
 */
export class SimpleCache<K, V> implements ICache<K, V> {
  /**
   * Data accessor. If no data exists, returns null
   */
  accessor: (key: K) => Promise<V | null>
  /**
   * Cache dict
   */
  cache: Map<K, V>

  /**
   * By default, will keep 1 adjacent data (previous and following).
   * @param accessor Accessor responsible for retrieving the data. The accessor must handle any invalid access and return appropriate value
   * @param options Cache options
   */
  constructor(accessor: (key: K) => Promise<V | null>) {
    this.accessor = accessor
    this.cache = new Map()
  }

  /**
   * Retrieve element
   * @param key Element to access
   * @returns Element
   */
  get(key: K) {
    // Load requested element
    let p;
    if (this.cache.has(key)) {
      p = Promise.resolve(this.cache.get(key)!)
    } else {
      p = this.accessor(key).then(data => {
        if (data === null) return null
        this.cache.set(key, data)
        return data
      })
    }
    return p
  }

  /**
   * Resets the cache (clears all cached data)
   */
  reset() {
    this.cache.clear()
  }
}

/**
 * A simple caching mechanism for data stored consecutively (e.g. paginated content).
 * The cache will store any data requested as well as adjacent data.
 */
export class ConsecutiveCache<V> implements ICache<number, V> {
  /**
   * Cache options
   */
  options: Required<CacheOptions>
  /**
   * Data accessor. If no data exists, returns null
   */
  accessor: (key: number) => Promise<V | null>
  /**
   * Cache dict
   */
  cache: {[key: number]: V}

  /**
   * By default, will keep 1 adjacent data (previous and following).
   * @param accessor Accessor responsible for retrieving the data. The accessor must handle any invalid access and return appropriate value
   * @param options Cache options
   */
  constructor(accessor: (key: number) => Promise<V | null>, options?: CacheOptions) {
    this.accessor = accessor
    this.options = {
      previousItems: 1,
      followingItems: 1,
      ...options
    }
    this.cache = {}
  }

  /**
   * Retrieve element
   * @param key Element to access
   * @returns Element
   */
  get(key: number) {
    // Load requested element
    let p;
    if (key in this.cache) {
      p = Promise.resolve(this.cache[key])
    } else {
      p = this.accessor(key).then(data => {
        if (data === null) return null
        this.cache[key] = data
        return data
      })
    }
    let storeNonNull = (key: number, elt: V | null) => {
      if (elt === null) return
      this.cache[key] = elt
    }
    // Load consecutive elements
    for (let i = 1; i <= this.options.previousItems; i++) {
      if (!((key - i) in this.cache))
        this.accessor(key - i).then(data => storeNonNull(key - i, data))
    }
    for (let i = 1; i <= this.options.followingItems; i++) {
      if (!((key + i) in this.cache))
        this.accessor(key + i).then(data => storeNonNull(key + i, data))
    }
    return p
  }

  /**
   * Resets the cache (clears all cached data)
   */
  reset() {
    this.cache = {}
  }
}