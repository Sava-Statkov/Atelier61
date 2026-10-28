// Generated from the local database by `npm run db:types`. Do not edit.
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    "public": {
        Tables: {
            "artwork_images": {
                Row: {
                    "alt": string | null;
                    "artwork_id": string;
                    "blur_data_url": string | null;
                    "created_at": string;
                    "credit": string | null;
                    "height": number;
                    "id": string;
                    "original_filename": string | null;
                    "rights": string;
                    "sort_order": number;
                    "source_hash": string;
                    "storage_path": string;
                    "width": number;
                };
                ComputedFields: never;
                Insert: {
                    "alt"?: string | null;
                    "artwork_id": string;
                    "blur_data_url"?: string | null;
                    "created_at"?: string;
                    "credit"?: string | null;
                    "height": number;
                    "id"?: string;
                    "original_filename"?: string | null;
                    "rights"?: string;
                    "sort_order"?: number;
                    "source_hash": string;
                    "storage_path": string;
                    "width": number;
                };
                Update: {
                    "alt"?: string | null;
                    "artwork_id"?: string;
                    "blur_data_url"?: string | null;
                    "created_at"?: string;
                    "credit"?: string | null;
                    "height"?: number;
                    "id"?: string;
                    "original_filename"?: string | null;
                    "rights"?: string;
                    "sort_order"?: number;
                    "source_hash"?: string;
                    "storage_path"?: string;
                    "width"?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "artwork_images_artwork_id_fkey";
                        columns: [
                            "artwork_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "artworks";
                        referencedColumns: [
                            "id"
                        ];
                    }
                ];
            };
            "artworks": {
                Row: {
                    "category_id": string | null;
                    "created_at": string;
                    "cycle_id": string | null;
                    "depth_cm": number | null;
                    "description": string | null;
                    "height_cm": number | null;
                    "id": string;
                    "note": string | null;
                    "on_home": boolean;
                    "published": boolean;
                    "slug": string;
                    "sort_order": number;
                    "sources": (string)[];
                    "technique": string | null;
                    "title": string | null;
                    "width_cm": number | null;
                    "year": number | null;
                };
                ComputedFields: never;
                Insert: {
                    "category_id"?: string | null;
                    "created_at"?: string;
                    "cycle_id"?: string | null;
                    "depth_cm"?: number | null;
                    "description"?: string | null;
                    "height_cm"?: number | null;
                    "id"?: string;
                    "note"?: string | null;
                    "on_home"?: boolean;
                    "published"?: boolean;
                    "slug": string;
                    "sort_order"?: number;
                    "sources"?: (string)[];
                    "technique"?: string | null;
                    "title"?: string | null;
                    "width_cm"?: number | null;
                    "year"?: number | null;
                };
                Update: {
                    "category_id"?: string | null;
                    "created_at"?: string;
                    "cycle_id"?: string | null;
                    "depth_cm"?: number | null;
                    "description"?: string | null;
                    "height_cm"?: number | null;
                    "id"?: string;
                    "note"?: string | null;
                    "on_home"?: boolean;
                    "published"?: boolean;
                    "slug"?: string;
                    "sort_order"?: number;
                    "sources"?: (string)[];
                    "technique"?: string | null;
                    "title"?: string | null;
                    "width_cm"?: number | null;
                    "year"?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "artworks_category_id_fkey";
                        columns: [
                            "category_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "categories";
                        referencedColumns: [
                            "id"
                        ];
                    },
                    {
                        foreignKeyName: "artworks_cycle_id_fkey";
                        columns: [
                            "cycle_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "cycles";
                        referencedColumns: [
                            "id"
                        ];
                    }
                ];
            };
            "categories": {
                Row: {
                    "id": string;
                    "name": string;
                    "slug": string;
                    "sort_order": number;
                };
                ComputedFields: never;
                Insert: {
                    "id"?: string;
                    "name": string;
                    "slug": string;
                    "sort_order"?: number;
                };
                Update: {
                    "id"?: string;
                    "name"?: string;
                    "slug"?: string;
                    "sort_order"?: number;
                };
                Relationships: [
                ];
            };
            "cycles": {
                Row: {
                    "description": string | null;
                    "featured_artwork_id": string | null;
                    "id": string;
                    "name": string;
                    "slug": string;
                    "sort_order": number;
                };
                ComputedFields: never;
                Insert: {
                    "description"?: string | null;
                    "featured_artwork_id"?: string | null;
                    "id"?: string;
                    "name": string;
                    "slug": string;
                    "sort_order"?: number;
                };
                Update: {
                    "description"?: string | null;
                    "featured_artwork_id"?: string | null;
                    "id"?: string;
                    "name"?: string;
                    "slug"?: string;
                    "sort_order"?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: "cycles_featured_artwork_id_fkey";
                        columns: [
                            "featured_artwork_id"
                        ];
                        isOneToOne: false;
                        referencedRelation: "artworks";
                        referencedColumns: [
                            "id"
                        ];
                    }
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            "create_artwork_with_image": {
                Args: {
                    "p_blur_data_url": string;
                    "p_category_id": string;
                    "p_credit": string;
                    "p_cycle_id": string;
                    "p_height": number;
                    "p_original_filename": string;
                    "p_rights": string;
                    "p_slug": string;
                    "p_source_hash": string;
                    "p_storage_path": string;
                    "p_title": string;
                    "p_width": number;
                };
                Returns: string;
            };
            "is_admin": {
                Args: Record<PropertyKey, never>;
                Returns: boolean;
            };
            "reorder_artworks": {
                Args: {
                    "p_ids": (string)[];
                };
                Returns: undefined;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];
export type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
export type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
export type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof DatabaseWithoutInternals;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
export type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof DatabaseWithoutInternals;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
export type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof DatabaseWithoutInternals;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;
export const Constants = {
    "public": {
        Enums: {}
    }
} as const;
