import { ICreateChatCompletionProps, ICreateChatCompletionResponse, createChatCompletion } from ".";
import { IUserSetting } from "../interface";
type ITask = ({
    status: 'pending' | 'success' | 'failed';
    task: Promise<ICreateChatCompletionResponse>;
} | {
    task: null
    status: 'icebox';
}) & {
    props: ICreateChatCompletionProps;
}
export class TaskPool {
    pool: ITask[] = [];
    public threadNumber: number = 2;
    // public thread: { task: Promise<ICreateChatCompletionResponse>; status: string }[] = [];
    config: IUserSetting;
    constructor (config: IUserSetting) {
        this.config = config;
    }
    public addTask (taskProps: ICreateChatCompletionProps) {
        this.pool.push({
            task: null,
            status: 'icebox',
            props: taskProps
        })
    }
    public async runTask (task: ITask, resolve: (value: unknown) => void) {
       try {
        const res = await createChatCompletion(task.props, this.config);
        this.runNextTask(resolve)
        return res;
       } catch (error) {
        task.status = 'failed';
        // throw error;
       }
    }
    public runNextTask (resolve: (value: unknown) => void): boolean {
        for (let i = 0; i < this.pool.length; i++) {
            if (this.pool[i].status === 'failed' || this.pool[i].status === 'icebox') {
                this.runTask(this.pool[i], resolve)
                return true;
            }
        }
        const result = this.pool.filter(task => task.status === 'success').map(task => task.task)
        resolve(result);
        return false;
    }
    // public async runTask (): Promise<ICreateChatCompletionResponse> {
    //     const res = 
    // }
    public run () {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < this.pool.length; i++) {
                this.runTask(this.pool[i], resolve);
            }
        })
    }
}