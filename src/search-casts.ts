import axios from 'axios';
import { getUserProfile } from './get-fc-users';

// Hubble instance running locally
const HUBBLE_URL = 'http://localhost:2281/v1';

const printWarpcastURL = (username: string, cast: any) => {
  console.log(`https://warpcast.com/${username}/${cast.hash}`);
};

// Get all casts for a given FID
const getCasts = async (fid: number, username: string): Promise<any> => {
  const { data } = await axios.get(HUBBLE_URL + '/castsByFid', {
    params: {
      fid,
    },
  });

  for (const cast of data.messages) {
    if (cast.data.type === 'MESSAGE_TYPE_CAST_ADD') {
      // Search for casts with Zora links
      if (cast.data.castAddBody.text.match(RegExp('https://zora.co/collect/*'))) {
        printWarpcastURL(username, cast);
      }
    }
  }
};

const searchZoraArtists = async () => {
  for (let fid = 2; fid < 20000; fid++) {
    try {
      const profile = await getUserProfile(fid);

      // Check if "artist" is in the bio
      if (profile?.bio?.includes('artist')) {
        // There will be some false negative by
        // filter out the ones that don't have artist in their bio,
        // but it's necessary to reduce the number of results
        // to a manageable number
        await getCasts(fid, profile.username!);
      }
    } catch (e) {}
  }
};

searchZoraArtists();
