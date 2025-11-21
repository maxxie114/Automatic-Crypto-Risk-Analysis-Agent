/**
 * Function to search for tokens on DexScreener.
 *
 * @param {Object} args - Arguments for the search.
 * @param {string} args.q - The search query for tokens.
 * @returns {Promise<Object>} - The result of the token search.
 */
const executeFunction = async ({ q }) => {
  const baseUrl = 'https://api.dexscreener.com/latest/dex/search/';
  const token = process.env.TRADESTATION_API_KEY;
  try {
    // Construct the URL with query parameters
    const url = new URL(baseUrl);
    url.searchParams.append('q', q);

    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching for tokens:', error);
    return {
      error: `An error occurred while searching for tokens: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    };
  }
};

/**
 * Tool configuration for searching tokens on DexScreener.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'search_tokens',
      description: 'Search for tokens on DexScreener.',
      parameters: {
        type: 'object',
        properties: {
          q: {
            type: 'string',
            description: 'The search query for tokens.'
          }
        },
        required: ['q']
      }
    }
  }
};

export { apiTool };