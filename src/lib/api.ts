import axios from "axios";

const BASE_URL = "https://enterprise-mediafirewall-ai.millionvisions.ai";

export interface Profile {
  _id: string;
  _collection: string;
  name: string;
  image_url: string;
  image_attributes: {
    hair?: { hair_style?: string };
    hair_length?: string;
    eye_color?: string;
    eye_size?: string;
    skin_color?: string;
  };
}

export interface ProfilesResponse {
  page: number;
  page_size: number;
  count: number;
  data: Profile[];
}

export interface Stats {
  total: number;
  completed: number;
  pending: number;
  percent: number;
}

export interface UpdatePayload {
  _id: string;
  _collection: string;
  hair_style: string;
  hair_length: string;
  eye_color: string;
  eye_size: string;
  skin_color: string;
}

export const fetchProfiles = async (page = 1, pageSize = 40) => {
  const { data } = await axios.get<ProfilesResponse>(
    `${BASE_URL}/profiles/page?page=${page}&page_size=${pageSize}`
  );
  return data;
};

export const fetchStats = async () => {
  const { data } = await axios.get<Stats>(`${BASE_URL}/stats`);
  return data;
};

export const updateProfile = async (payload: UpdatePayload) => {
  const { data } = await axios.post(`${BASE_URL}/profiles/update`, payload);
  return data;
};
