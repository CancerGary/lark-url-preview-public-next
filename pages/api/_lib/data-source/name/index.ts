import { NameDataSourceSync } from "@/pages/api/_lib/data-source/name/sync";
import { DataSource } from "@/pages/api/_lib/data-source/abstract";
import { NameInfo } from "@/pages/api/_lib/data-source/name/types";
import { HbsAsyncTask } from "@/pages/api/_lib/hbs-engine/process-handlebars";
import { UserInfo } from "@/pages/api/_handler/storage";

export class NameDataSource
  extends NameDataSourceSync
  implements DataSource<NameInfo>
{
  async executeTask({
    hbsAsyncTasks,
    senderInfo,
  }: {
    hbsAsyncTasks: HbsAsyncTask[];
    senderInfo: Partial<UserInfo>;
  }) {
    return this.data;
  }
}
