import {gapi} from "gapi-script";

/**
 * Updates a given file with the given content.
 * @param {String} fileID - ID of the file to update.
 * @param {*} rawContent - Raw data to send.
 * @returns {Promise<void>}
 */
export const updateFile = async (fileID, rawContent) => {
  try {
    const response = await gapi.client.request({
      path: '/upload/drive/v3/files/' + fileID,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(rawContent)
    })

    console.log('File updated with ID:', response);
  } catch (error) {
    console.error('Error updating file content:', error);
  }
}