export interface TabItem {
  id: string;
  title: string;
  icon: string;
  subMenus?: {
    id: string;
    name: string;
    icon: string;
    link: string;
  }[];
}