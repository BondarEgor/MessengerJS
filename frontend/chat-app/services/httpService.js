export function httpService(baseUrl = "http://localhost:3000") {
  async function get(url) {
    const response = await fetch(`${baseUrl}/${url}`);
    return await response.json();
  }

  return {
    get,
  };
}
