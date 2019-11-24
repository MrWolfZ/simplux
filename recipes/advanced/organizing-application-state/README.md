# Recipe: organizing my application state

This recipe shows you some best practices for using **simplux** to organize your application state.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> This recipe does not have code since it is focused on a more abstract high-level design process.

As you know in **simplux** all state is contained in modules. These modules represent a natural boundary for organizing your state. We therefore recommend that you split your application state into multiple independent modules. The most important question then is: how do you decide what state should be placed in a module? Unfortunately, there is no clear answer to this since it heavily depends on the application you are building. However, we can explore the different kinds of modules you will typically use in an application.

Let's imagine we have been given the task to build a new application. These are the requirements our stakeholders have given to us:

- feature 1: a simple calculator that works offline
- feature 2: a private task list that is synchronized between devices
- a way to switch between these two features in the application

With these requirements we can create a technical design. Here are some of the most important points:

- the calculator can be created completely client-side
- the items for the task list must be stored on a server
- the task list must be protected by a login

Additionally, our UI designers have made the following design decisions:

- a sidebar will allow switching between the features
- when switching from one feature to the other and back the user can continue where they left off (e.g. a task item they were typing up when switching to the calculator and back)

The following HTML and graphical representation show how our application could look like.

> Here we are going to use a bit of pseudo-HTML code. Your real application is likely using some kind of library or framework for rendering your views. Our [recipes](../../../../..#recipes) can show you how to use **simplux** with your library/framework of choice (for example [React](../../react/using-in-react-application#readme) or [Angular](../../angular/using-in-angular-application#readme)).

```html
<body>
  <sidebar>
    <calculator-link />
    <task-list-link />
  </sidebar>

  <content>
    <calculator if="calculatorIsActive">
    <taskList if="taskListIsActive">
  </content>
</body>
```

```
/----------------------------------------------------\
| sidebar       | either the calculator or task list |
|               |                                    |
|  - calculator |                                    |
|  - task list  |                                    |
|               |                                    |
|               |                                    |
|               |                                    |
|               |                                    |
|               |                                    |
\----------------------------------------------------/
```

Now that we know the requirements as well as the technical and UX design, we can start thinking about the state we need to manage for this application:

- any user inputs and the result for the calculator
- the logged in user's tasks that have been loaded from the server
- any user inputs for the task list
- information about the API interaction (e.g. is data currently loading, was there an error etc.)
- which feature is currently active
- whether the user is logged in or not
- some information about the logged in user (e.g. an authentication token)

Two **simplux** modules that emerge quite naturally are one for the calculator and one for the task list. These two features contain what we would call our _business logic_ and they are completely independent of each other. The task list module can also contain the API interaction logic. The state for these two modules can be roughly described by the following interfaces.

```ts
interface CalculatorState {
  enteredData: string // e.g. "24+12*2"
}

interface TaskItem {
  id: string
  text: string
}

interface TaskListState {
  taskItems: TaskItem[]
  newTaskText: string
  dataIsLoading: boolean
  dataLoadError: string
}
```

You application probably also consists of multiple independent features. Therefore, the following is a good rule of thumb for organizing your state:

> Look for the independent features in your application and create a module for each feature. Larger features can often be decomposed into multiple modules.

Next, let's look at how to determine which feature is currently active. One way to do this would be to add a boolean flag to each feature module to mark it as active or inactive. However, if we think about the constraints for this information, we find this is probably not the right approach. The main constraint here is that at most one feature can be active at once. If we put this information into the feature modules we will have to synchronize them to ensure we adhere to the constraint. An alternative better design would be to encapsulate this information in a separate independent module which will easily allow us to fulfill the constraint in our mutations. Since this module only contains UI state, let's call it by the name of the UI component that accesses it the most: the sidebar.

```ts
interface SidebarState {
  activeFeature: 'calculator' | 'taskList'
}
```

You application probably also has a lot of constraints for your data. Therefore, the following is a good rule of thumb for organizing your state:

> Look for the constraints in your data model and create modules along those constraints. To find the constraints look at which data often changes together.

The final kind of state we need to manage is about the logged in user.

```ts
interface UserState {
  isLoggedIn: boolean
  authenticationToken: string | undefined
}
```

While this seems simple enough, this design conflicts with some of the guidelines we have established so far. Specifically, whether the user is logged in or not has an impact on both our task list module as well as the sidebar module. While the user is not logged in they must not be able to navigate to the task list (instead, they should probably be redirected to some kind of login page). In addition, when the user logs out we must remove any loaded tasks for them.

As always, there are multiple ways to achieve this, and none of them is _right_ per-se. Let's have a look at some of the options and their trade-offs.

The simplest option (at least in terms of our **simplux** modules) is to orchestrate all the required logic in your UI components. For example, from your component that contains the logout functionality, you can call mutations on all the modules that need updating. This option has the advantage of keeping your modules cleanly separated and independent. However, one disadvantage is that it becomes harder to ensure all constraints are adhered to, especially in terms of testing.

Another option is to synchronize state between the modules. The recipe for [communicating between modules](../../advanced/communicating-between-modules#readme) shows you a number of strategies for achieving this. However, regardless of how this is done, it has the downside of coupling the modules to each other, which can make changing the modules be more difficult. One major advantage of this option is that all the logic is cleanly contained in the modules, which makes it easy to test and keeps your UI components free of complicated orchestration logic.

> What option you choose for dealing with this kind of situation is up to you and depends on many factors (for example how many features there are, how often the application changes, etc.). If you are unsure what to do we recommend you try out different options to develop a better understanding of what will work well in your specific situation.

Hopefully this recipe could provide you with some useful advice for managing your application state with **simplux**. If you want to see concrete implementations of the application discussed in this recipe there are recipes for [React](../../react/building-non-trivial-applications#readme) and [Angular](../../angular/building-non-trivial-applications#readme) that show you how to build this application with those technologies.
