import axios from "axios";
import { Platform } from "react-native";

const restful = async (method: "GET" | "POST", uri: string, params: any, form?: string) => {
  let url = "http://localhost:8080/" + uri;
  let result: any;
  let formData = new FormData();
  if (form) {
    const files = params.assets[0];
    formData.append("file", {
      uri: Platform.OS === "android" ? files.uri : files.uri.replace("file://", ""),
      name: files.fileName || "file",
      type: files.type || "application/octet-stream",
    } as any);
  }

  try {
    switch (method) {
      case "GET":
        result = await axios.get(url, {
          params: params,
          headers: {
            Authorization: "Bearer" + localStorage.getItem("token"),
            // 추후 JWT token 적용
          },
        });
        break;
      case "POST":
        if (!form) {
          result = await axios.post(url, params);
          // { headers: {}} 추후 JWT token 적용
        } else {
          result = await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
        }
        break;
    }
    return result.data;
  } catch (error: any) {
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.response?.data ? error.response.data.message : error.message,
    };
  }
};

export default restful;
