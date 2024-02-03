import fetch from 'node-fetch';

export const retrieveRandomText = async (): Promise<string> => {
  const response = await fetch(
    'https://random-word-api.herokuapp.com/word?number=20',
  );
  if (response.ok) {
    const data = (await response.json()) as string[];
    return data.join(' ');
  } else {
    throw Error('Could not retrieve random words array from server');
  }
};
