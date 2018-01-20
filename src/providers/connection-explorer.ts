import fs = require('fs');
import path = require('path');
import {
  Event,
  EventEmitter,
  ProviderResult,
  TreeDataProvider,
  TreeItemCollapsibleState,
} from 'vscode';
import LoggerInterface from '../api/interface/logger';
import { Logger } from './../api';
import Connection from './../api/connection';
import { SidebarColumn, SidebarDatabase, SidebarTable } from './sidebar-provider/sidebar-tree-items';

export type SidebarDatabaseItem = SidebarDatabase | SidebarTable | SidebarColumn;

export class ConnectionExplorer implements TreeDataProvider<SidebarDatabaseItem> {
  public onDidChange: EventEmitter<SidebarDatabaseItem | undefined> = new EventEmitter();
  public readonly onDidChangeTreeData: Event<SidebarDatabaseItem | undefined> =
    this.onDidChange.event;
  private tree: any = {};
  public fireUpdate(): void {
    this.onDidChange.fire();
  }

  public getTreeItem(element: SidebarDatabaseItem): SidebarDatabaseItem {
    return element;
  }

  public getChildren(element?: SidebarDatabaseItem): ProviderResult<SidebarDatabaseItem[]> {
    if (!element) {
      return Promise.resolve(this.toArray(this.tree));
    } else if (element instanceof SidebarDatabase) {
      return Promise.resolve(this.toArray(element.tables));
    } else if (element instanceof SidebarTable) {
      return Promise.resolve(this.toArray(element.columns));
    }
    return [];
  }
  public refresh() {
    this.fireUpdate();
  }

  public setTreeData(tables, columns) {
    this.tree = {};
    tables.sort((a, b) => a.name.localeCompare(b.name)).forEach((table, index) => {
      if (!this.tree[table.tableDatabase]) {
        this.tree[table.tableDatabase] = new SidebarDatabase({ name: table.tableDatabase });
      }
      if (!this.tree[table.tableDatabase].tables[table.name]) {
        this.tree[table.tableDatabase].tables[table.name] = new SidebarTable(table);
      }
    });
    columns.sort((a, b) => a.columnName.localeCompare(b.columnName)).forEach((column) => {
      this.tree[column.tableDatabase].tables[column.tableName].columns.push(new SidebarColumn(column));
    });
    this.fireUpdate();
  }

  private toArray(obj: any) {
    return Object.keys(obj).map((k) => obj[k]);
  }
}

export { SidebarColumn, SidebarDatabase, SidebarTable };
