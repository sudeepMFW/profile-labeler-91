import axios from "axios";

const BASE_URL = "https://enterprise-mediafirewall-ai.millionvisions.ai";

export interface Profile {
  _id: string;
  _collection: string;
  name: string;
  image_url: string;
  image_attributes: {
    hair?: {
      hair_style?: string;
      hair_color?: string;
    };
    accessories?: {
      eyewear?: string;
      headwear?: string;
    };
    facial_features?: {
      Eyebrow?: string;
    };
    hair_length?: string;
    eye_color?: string;
    eye_size?: string;
    skin_color?: string;
    face_shape?: string;
    head_hair?: string;
    beard?: string;
    mustache?: string;
    ethnicity?: string;
    attire?: string;
    body_shape?: string;
    face_size?: string;
    face_structure?: string;
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
  updated_by: string;
  face_shape?: string;
  head_hair?: string;
  beard?: string;
  mustache?: string;
  ethnicity?: string;
  eye_color?: string;
  attire?: string;
  body_shape?: string;
  skin_color?: string;
  eye_size?: string;
  face_size?: string;
  face_structure?: string;
  hair_length?: string;
  hair_color?: string;
  hair_style?: string;
  eyewear?: string;
  headwear?: string;
  eyebrow?: string;
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
