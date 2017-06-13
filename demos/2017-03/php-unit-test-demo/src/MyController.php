<?php

require_once 'MySession.php';
require_once 'UserDAO.php';
require_once 'ViewFactory.php';
require_once 'WelcomeView.php';
require_once 'DashboardView.php';

/**
	this class illustrates a controller within a mini mvc system.
*/
class MyController
{
	protected $userDAO; // used to access user data
	protected $mySession; // used to access data associated with the current logged in session
	protected $view; // the view which should be rendered after the controller finishes execution

	/**
		returns the controller's desired view object
		(for example, so that the view may be rendered by the ioc container that instantiated this controller)
	*/
	public function getView()
	{
		return $this->view;
	}
	
	/**
		call this to inject the UserDAO dependency
	*/
	public function setUserDAO($userDAO)
	{
		$this->userDAO = $userDAO;
	}

	/**
		call this to inject the MySession dependency
	*/
	public function setMySession($mySession)
	{
		$this->mySession = $mySession;
	}
	
	/**
		call this to inject the ViewFactory dependency
	*/
	public function setViewFactory($viewFactory)
	{
		$this->viewFactory = $viewFactory;
	}
	
	/**
		this is the controller's main logic.
		a requirement of this mini mvc framework is that main() must set $this->view to the desired view,
		and initialize that view with any needed variables.
		all dependencies must be injected before main() may be called.
	*/
	public function main()
	{
		// check the session to see if the user is logged in
		$loggedInUserId = $this->mySession->getUserId();

		if($loggedInUserId === null)
		{	// nobody is logged in, so show the WelcomeView
			$this->view = $this->viewFactory->getView('WelcomeView');
			$this->view->init();
		}
		else
		{	// a user is logged in, so show the DashboardView
			$userData = $this->userDAO->getUser($loggedInUserId);
			
			$this->view = $this->viewFactory->getView('DashboardView');
			$this->view->init(array(
				'userName' => $userData->userName,
				'userAge' => $userData->userAge
			));
		}
	}
}
