import { ConsecutiveCache, type ICache } from "./Cache";

interface PageResponse<T> {
  items: T[]
  page: number
  per_page: number
  total_count: number
}

interface PagerOptions {
  preventMultipleLoadings?: boolean
}

function loadingGuard(target: any, name: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function (...args: any[]) {
    // @ts-ignore: Doesn't understand "this" in this context
    if (this.options.preventMultipleLoadings && this.isLoading) {
      return Promise.reject('Prevent multiple loadings');
    }
    return method.apply(this, args);
  }
}

/**
 * A paginator is used to split a large amount of element into chunks.
 * It also handles caching.
 */
export interface Paginator {
  /**
   * Current page number
   */
  current: number
  /**
   * Maximum page number
   */
  max: number
  isLoading: boolean

  /**
   * Resets the pager for a new batch of elements
   */
  reset: () => void

  displayPage: (page: number) => Promise<any>

  nextPage: () => Promise<any>

  previousPage: () => Promise<any>

  firstPage: () => Promise<any>

  lastPage: () => Promise<any>
}

/**
 * The page will handle the logic of pagination for a given type of data.
 */
export class Pager<T> implements Paginator {
  /**
   * Current page number
   */
  current: number
  /**
   * Maximum page number
   */
  max: number
  /**
   * If the pager is loading a page
   */
  isLoading: boolean
  /**
   * Function that loads a page
   */
  protected pageLoader: (page: number) => Promise<T | null>
  /**
   * Function that displays a page
   */
  protected pageDisplay: (data: T) => Promise<any>
  /**
   * Pager configuration options
   */
  protected options: {
    /**
     * If set to true, prevents page change while loading a page
     */
    preventMultipleLoadings: boolean
    /**
     * If set to true, page caching will be performed by the pager (RECOMMENDED)
     */
    enableCache: boolean
    /**
     * If set to true, pages before and after the current page will also be loaded in advance (RECOMMENDED)
     */
    preload: boolean
  }
  /**
   * Page cache
   */
  protected cache: ICache<number, T>

  constructor(pageLoader: (page: number) => Promise<T | null>, pageDisplay: (data: T) => Promise<any>, options?: PagerOptions) {
    this.current = 1
    this.max = 1
    this.pageLoader = pageLoader
    this.pageDisplay = pageDisplay
    this.options = {
      preventMultipleLoadings: true,
      enableCache: true,
      preload: true,
      ...options
    }
    this.isLoading = false
    this.cache = new ConsecutiveCache<T>(this.pageLoader)
  }

  /**
   * Resets the pager for a new batch of elements
   */
  reset() {
    this.current = 1
    this.max = 1
    this.cache.reset()
    this.isLoading = false
  }

  displayPage(page: number) {
    this.isLoading = true
    return this.cache.get(page).then(data => {
      if (data === null) return
      this.pageDisplay(data)
    }).finally(() => this.isLoading = false)
  }

  @loadingGuard
  nextPage() {
    if (this.current < this.max) {
      return this.displayPage(this.current + 1)
        .then(() => this.current++)
    }
    return Promise.resolve()
  }

  @loadingGuard
  previousPage() {
    if (this.current > 1) {
      return this.displayPage(this.current - 1)
        .then(() => this.current--)
    }
    return Promise.resolve()
  }

  @loadingGuard
  firstPage() {
    return this.displayPage(1)
      .then(() => this.current = 1)
  }

  @loadingGuard
  lastPage() {
    return this.displayPage(this.max)
      .then(() => this.current = this.max)
  }
}

/**
 * Will handle any pagination performed by the API.
 */
export class ApiPager<T> extends Pager<T[]> {
  private apiPagerLoder
  constructor(pageLoader: (page: number) => Promise<PageResponse<T>>, pageDisplay: (data: T[]) => Promise<any>, options?: PagerOptions) {
    super((key: number) => {
      if (this.max == 0) return Promise.resolve([])
      if (key < 1 || key > this.max) return Promise.resolve(null)
      return pageLoader(key).then(res => {
        this.max = Math.ceil(res.total_count / res.per_page)
        return res.items
      })
    }, pageDisplay, options)
    this.apiPagerLoder = pageLoader
  }

  init() {
    // Load first page to retrieve the number of elements
    // Bypasses the cache because we need to set this.max
    return this.apiPagerLoder(1).then(res => {
      this.max = Math.ceil(res.total_count / res.per_page)
      return this.displayPage(1)
    })
  }
}
