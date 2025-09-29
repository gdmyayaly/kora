export interface Workspace {
  workspace_id: string;
  name: string;
  is_default: boolean;
  is_owner: boolean;
  role: string;
  owner_id: string;
  companies_count: number;
  created_at: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  is_default: boolean;
}

export interface WorkspaceListResponse {
  code: number;
  data?: Workspace[];
  error: null;
  message: string;
  success: boolean;
}

export interface CreateWorkspaceResponse {
  data: {
    workspace_id: string;
    name: string;
    is_default: boolean;
    created_at: string;
  };
  message: string;
  success: boolean;
}

export interface WorkspaceErrorResponse {
  code: number;
  error: string;
  message: string;
  success: boolean;
}

export interface WorkspaceFormData {
  name: string;
  is_default: boolean;
}

export interface WorkspaceDetail {
  workspace_id: string;
  name: string;
  is_default: boolean;
  is_owner: boolean;
  role: string;
  owner_id: string;
  companies_count: number;
  permissions: string[];
  created_at: string;
}

export interface WorkspaceDetailResponse {
  code: number;
  data: WorkspaceDetail;
  error: string | null;
  message: string;
  success: boolean;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceResponse {
  code: number;
  data: WorkspaceDetail;
  error: string | null;
  message: string;
  success: boolean;
}

export interface DeleteWorkspaceResponse {
  code: number;
  data: null;
  error: string | null;
  message: string;
  success: boolean;
}

export interface SetDefaultWorkspaceResponse {
  code: number;
  data: WorkspaceDetail;
  error: string | null;
  message: string;
  success: boolean;
}