export function buildSupabaseMock() {
  const chain: any = {
    _data: null,
    _error: null,
  };
  
  chain.select = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockReturnValue(chain);
  
  // To handle the final execution which is usually a Promise
  chain.then = jest.fn((onFulfilled, onRejected) => {
    if (chain._error && onRejected) {
      return Promise.reject(chain._error).catch(onRejected);
    }
    const result = { data: chain._data, error: chain._error };
    return Promise.resolve(onFulfilled ? onFulfilled(result) : result);
  });
  
  // Also handle catch
  chain.catch = jest.fn((onRejected) => {
    if (chain._error) {
      return Promise.reject(chain._error).catch(onRejected);
    }
    return Promise.resolve();
  });

  return chain;
}
